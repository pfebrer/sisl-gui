from typing import Dict, Any, Union, Optional, List

import inspect
import logging
from io import StringIO, BytesIO

from pathlib import Path

import sisl
from sisl.nodes import Node, Workflow
from sisl.nodes.node import ConstantNode

from .sync import Synchronized
from .json import CustomJSONEncoder, as_jsonable

def get_all_subclasses(cls):
    return set(cls.__subclasses__()).union(
        [s for c in cls.__subclasses__() for s in get_all_subclasses(c)])

class Session:
    """Base session class that implements the functionality of a session in the GUI"""

    # Object that dispatches session methods and automatically updates the GUI
    synced: Synchronized

    # Logging parameters
    logger: logging.Logger
    log_level: str = "INFO"
    logs: StringIO

    # Dictionary that stores all nodes that the session knows about, being the key the node ID
    nodes: Dict[int, Dict] = {}
    # Dictionary that maps node names to their IDs so that nodes can be accessed
    # in a more human-friendly way.
    _name_to_id: Dict[str, int] = {}

    def __init__(self, *args, **kwargs):

        # Initialize the synchronized object
        self.synced = Synchronized(self)

        # Initialize node management
        self.nodes = {}
        self._name_to_id = {}

        # Retrieve all node classes
        self._node_classes = {
            id(cls): cls for cls in get_all_subclasses(Node)
        }

        # Initialize the logging stream
        self.logs = StringIO()
        # And the logger
        self.logger = logging.getLogger(str(id(self)))
        self.logger.setLevel(getattr(logging, self.log_level.upper()))

        # Add the handler so that the logs are written to the stream
        self._log_handler = logging.StreamHandler(self.logs)
        self._log_handler.setFormatter(
            logging.Formatter(fmt='%(asctime)s | %(levelname)-8s :: %(message)s')
        )

        self.logger.addHandler(self._log_handler)

        self.settings = {
            "file_storage_dir": ".sisl_gui_uploaded_files",
            "keep_uploaded": False,
        }

    def get_file_plot_options(self, file_name):

        plot_handler = sisl.get_sile(file_name).plot
        options = list(plot_handler._dispatchs.keys())

        return options
    
    # Functions to receive uploaded files:
    def write_file(self, file_bytes, name):
        dirname = Path(self.settings["file_storage_dir"])
        if not dirname.exists():
            dirname.mkdir()

        file_name = dirname / name
        with open(file_name, "wb") as fh:
            fh.write(file_bytes)

        keep = self.settings["keep_uploaded"]

        return file_name, dirname, keep
    
    def _remove_temp_file(self, file_name, dirname):
        # Remove the file
        file_name.unlink()
        # If the directory is empty, remove it as well
        try:
            dirname.rmdir()
        except:
            pass
    
    def plot_uploaded_file(self, 
        name: str, 
        file_bytes: Optional[BytesIO] = None, 
        method: Optional[str] = None, 
        node_name: Optional[str] = None, 
        additional_files: Dict[str, BytesIO] = {}
    ) -> int:

        if file_bytes is None:
            # We will assume that the file is already written.
            file_name = Path(name)
            keep = True
            dirname = file_name.parent
        else:
            file_name, dirname, keep = self.write_file(file_bytes, name)

        additional_files_info = []
        for n, file in additional_files.items():
            additional_files_info.append(self.write_file(file, n))

        plot_handler = sisl.get_sile(file_name).plot
        if method is None:
            plot = plot_handler()
        else:
            plot = getattr(plot_handler, method)()

        try:
            plot.get()
        except:
            pass

        self.add_node(plot, node_name or name)

        if not keep:
            self._remove_temp_file(file_name, dirname)

        for file_name, dirname, keep in additional_files_info:
            if not keep:
                self._remove_temp_file(file_name, dirname)

        return id(plot)

    def add_node(self, obj: Any, name: Union[str, None] = None):
        """Adds a node to the session.
        
        Parameters
        ----------
        obj : Any
            The object to add to the session. If it is not a node, a new CONSTANT node
            will be created with the object as its value.
        name : Union[str, None], optional
            The name of the node. If None, the name will be the name of the node class.
            If the name is already taken, a number will be appended to it.
        """
        # If the object is not a node, create a new constant node with the object as its value.
        if not isinstance(obj, Node):
            obj = ConstantNode(obj)

        # If the name is None, use the name of the class
        if name is None:
            name = obj.__class__.__name__
        
        # Make sure the name is unique
        original_name = name
        i = 1
        while name in self._name_to_id:
            name = f"{original_name}_{i}"
            i += 1
        
        # Get the ID of the object and use it as the key to store the node.
        obj_id = id(obj)
        self.nodes[obj_id] = {
            "name": name,
            "node": obj,
        }
        
        # Keep track of the name to ID mapping
        self._name_to_id[name] = obj_id
    
    def get_node(self, key: Union[str, int]) -> Node:
        """Returns the node that corresponds to the given key.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.

        Returns
        -------
        Node
            The node object that was requested.
        """

        if isinstance(key, str):
            key = self._name_to_id[key]
        
        return self.nodes[key]["node"]
    
    def remove_node(self, key: Union[str, int]):
        """Removes the node that corresponds to the given key.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.

        See Also
        --------
        get_node
        """
        node = self.get_node(key)
        if len(node._output_links) > 0:
            if any(id(linked_node) in self.nodes for linked_node in node._output_links):
                raise ValueError("Cannot remove a node that has output links to other registered nodes.")
        
        obj_id = self._name_to_id.pop(key, None)
        self.nodes.pop(obj_id, None)

    def init_node(self, cls: int, kwargs={}, input_modes={}, name: Union[str, None] = None):
        """Initializes a new node.
        
        Parameters
        ----------
        cls : int
            The ID of the node class.
        kwargs : dict, optional
            All the inputs that should be used to initialize the node.
        input_modes : dict, optional
            For each input key in kwargs, a mode specifying how to interpret the value.
            If the mode is "NODE", the value will be interpreted as the ID of a node, and therefore
            will be replaced by the corresponding node object.
        name : Union[str, None], optional
            The name of the node. If None, the name will be automatically determined by ``add_node``.

        """
        node_class = self._node_classes[cls]
        
        args_key = node_class._args_inputs_key
        kwargs_key = node_class._kwargs_inputs_key
        
        # Remove values for variadic arguments if they are None
        # (they should be either a list for *args or a dict for **kwargs)
        for k in (args_key, kwargs_key):
            if kwargs.get(k) is None:
                kwargs.pop(k, None)
        
        # Parse values into nodes if the input mode in the GUI was "node"
        # If it is a variadic argument, loop through inputs.
        for k, v in input_modes.items():
            if v == "NODE" and k in kwargs:
                if k == args_key:
                    kwargs[k] = [self.get_node(node_id) for node_id in kwargs[k]]
                elif k == kwargs_key:
                    for kwarg_key in kwargs[k]:
                        kwargs[kwarg_key] = self.get_node(kwargs[k][kwarg_key])
                    kwargs.pop(k)
                else:
                    kwargs[k] = self.get_node(kwargs[k])
                    
        args = []
        # If *args are passed, then we need to get all the arguments that
        # go before them and place them at their right position.
        if args_key is not None and args_key in kwargs:
            params = inspect.signature(node_class.function).parameters
            for k, param in params.items():
                if k == args_key:
                    args.extend(kwargs.pop(k))
                    break
                else:
                    args.append(kwargs.pop(k))
                    
        # Managing **kwargs is easier, we just expand the value of the kwargs field.       
        if kwargs_key is not None and kwargs_key in kwargs:
            kwargs.update(kwargs.pop(kwargs_key))
        
        # Initialize the node.
        new_node = node_class(*args, **kwargs)
        
        self.add_node(new_node, name)
        
    def update_node_inputs(self, key: Union[str, int], kwargs: Dict[str, Any] = {}, input_modes: Dict[str, str] = {}):
        """Updates the inputs of a stored node.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.
        kwargs : Dict[str, Any], optional
            The new values for the inputs of the node.
        input_modes : Dict[str, Any], optional
            For each input key in kwargs, a mode specifying how to interpret the value.
            If the mode is "NODE", the value will be interpreted as the ID of a node, and therefore
            will be replaced by the corresponding node object.

        See Also
        --------
        get_node
        """

        node = self.get_node(key)
        
        args_key = node._args_inputs_key
        kwargs_key = node._kwargs_inputs_key
        
        # Remove values for variadic arguments if they are None
        # (they should be either a list for *args or a dict for **kwargs)
        for k in (args_key, kwargs_key):
            if kwargs.get(k) is None:
                kwargs.pop(k, None)
        
        # Parse values into nodes if the input mode in the GUI was "node"
        # If it is a variadic argument, loop through inputs.
        for k, v in input_modes.items():
            if v == "NODE" and k in kwargs:
                if k == args_key:
                    kwargs[k] = [self.get_node(node_id) for node_id in kwargs[k]]
                elif k == kwargs_key:
                    kwargs[k] = {key: self.get_node(v) for key, v in kwargs[k].items()}
                else:
                    kwargs[k] = self.get_node(kwargs[k])
        
        node.update_inputs(**kwargs)
        
    def duplicate_node(self, key: Union[str, int], name: Union[str, None] = None):
        """Duplicates the node that corresponds to the given key.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.
        name : str, optional
            The name of the new node. If None, the name will be copied from the old node. 

        See Also
        --------
        get_node
        """
        node = self.get_node(key)

        if name is None:
            nodeid = self.get_nodeid(key)
            name = self.nodes[nodeid]['name']
        
        new_node = node.__class__(**dict(node.inputs))
        
        self.add_node(new_node, name)
        
    def get_nodeid(self, key: Union[str, int]) -> int:
        """Given either the name or the ID of a node, returns the ID of the node.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.
        """
        if isinstance(key, str):
            key = self._name_to_id[key]
        
        return key
        
    def rename_node(self, key: Union[str, int], name: str):
        """Renames the node that corresponds to the given key.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.
        name : str, optional
            The new name for the node.

        See Also
        --------
        get_node
        """
        nodeid = self.get_nodeid(key)
        
        old_name = self.nodes[nodeid]['name']
        
        del self._name_to_id[old_name]
        self._name_to_id[name] = nodeid
        
        self.nodes[nodeid]['name'] = name
    
    def node_to_workflow(self, key: Union[str, int]) -> Workflow:
        """Considering a certain node as a workflow output, creates a workflow.

        It does so by recursively traversing nodes through their inputs until it reaches
        the leaves of the tree. The leaves are then considered as the inputs of the new workflow.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.

        See Also
        --------
        get_node
        """
        node = self.get_node(key)

        names_map = {node_id: name for name, node_id in self._name_to_id.items()}
        
        return Workflow.from_node_tree(node, names_map=names_map)
    
    def compute_node(self, key: Union[str, int]):
        """Computes the node that corresponds to the given key.
        
        Parameters
        ----------
        key : Union[str, int]
            The key of the node. If it is a string, it will be interpreted as the name of the node.
            If it is an integer, it will be interpreted as the ID of the node.

        See Also
        --------
        get_node
        """
        node = self.get_node(key)
        
        node.get()

    def to_json(self):
        """Creates a JSON representation of the session, to send to the frontend."""
        
        encoder = CustomJSONEncoder()

        self._node_classes = {}

        for cls in get_all_subclasses(Node):
            try:
                encoder.encode(cls)
                self._node_classes[id(cls)] = cls
            except Exception as e:
                pass

        return dict(
            logs=self.logs.getvalue(),
            nodes=self.nodes,
            node_classes=self._node_classes
        )
    
    def to_deep_json(self):

        encoder = CustomJSONEncoder()

        def encode(obj):

            if isinstance(obj, dict):
                return {k: encode(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [encode(v) for v in obj]
            else:
                return as_jsonable(encoder, obj)
            
        return encode(self.to_json())
    