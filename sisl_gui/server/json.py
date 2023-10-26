"""Implements conversion from python elements to JSON to send the messages."""

from typing import get_type_hints, Type, Dict, Callable

import pathlib

import simplejson
from simplejson.encoder import JSONEncoder

from plotly.graph_objects import Figure
import numpy as np
import inspect

import sisl
from sisl.nodes import Node

def get_fields_help_from_function(function: Callable) -> Dict[str, str]:
    """Parses a function's docstring following sisl's conventions into a dictionary of help strings.

    Parameters
    ----------
    function : Callable
        The function for which to parse the docstring.
    
    Returns
    -------
    dict[str, str]
        The dictionary containing a key value pair for each argument of the function.
    """
    sig = inspect.signature(function)
    
    fields = get_fields_help_from_docs(getattr(function, "__doc__", "") or "")

    sanitized_fields = {}
    for k, v in sig.parameters.items():
        if k in fields:
            sanitized_fields[k] = fields[k]
        else:
            sanitized_fields[k] = ""

    return sanitized_fields

def get_fields_help_from_docs(docs: str) -> Dict[str, str]:
    """Parses a docstring following sisl's conventions into a dictionary of help strings.

    Parameters
    ----------
    docs : str
        The docstring to parse.
    
    Returns
    -------
    dict[str, str]
        The dictionary containing a key value pair for each argument described in the docstring.
        Note that some arguments may be missing, or even there can be some extra arguments that
        are not really in the function's signature.
    """

    params_i = docs.find("Parameters\n")
    # Check number of spaces used for tabulation
    n_spaces = docs[params_i + 11:].find("-")

    params_docs = {}
    arg_key = None
    key_msg = ""
    for line in docs[params_i:].split("\n")[2:]:
        if len(line) <= n_spaces:
            break
            
        if line[n_spaces] != " ":
            if ":" not in line:
                break
            if arg_key is not None:
                params_docs[arg_key] = key_msg
            key_msg = ""
            arg_key = line.split(":")[0].lstrip()
        else:
            prefix = "" if key_msg.endswith(" ") or key_msg == "" else " "
            key_msg += prefix + line.lstrip()
    if arg_key is not None:
        params_docs[arg_key] = key_msg.capitalize()

    return params_docs

def annotation_to_input_type(annotation):
    """Converts the annotation of an argument to an input field type.
    
    Parameters
    ----------
    annotation : Any
        The annotation of the function argument.
    """

    if isinstance(annotation, type):
        annotation = annotation.__name__
        
    annotation = str(annotation)

    input_type = {
        'str': 'text',
        'int': 'number',
        'float': 'number',
        'bool': 'bool',
    }.get(annotation)

    return input_type

def as_jsonable(encoder, obj):
    if not isinstance(obj, (tuple, float, str, int, bool, type(None), np.ndarray)):
        return encoder.default(obj)
    else:
        return obj

def node_class_to_json(encoder, node_class: Type[Node]):
    """Parses a node class into a JSON object that can be sent to the client.
    
    Parameters
    ----------
    node_class : Type[Node]
        The node class to parse.
    """
    json_node_cls = {}

    json_node_cls['id'] = id(node_class)
    json_node_cls['name'] = node_class.__name__
    json_node_cls['doc'] = node_class.__doc__

    parameters_help = get_fields_help_from_function(node_class.function)

    if hasattr(node_class, "function"):
        try:
            type_hints = get_type_hints(node_class.function)
        except:
            type_hints = {}

        json_node_cls['output_type'] = str(type_hints.pop('return', None))

        parameters = inspect.signature(node_class.function).parameters

        json_node_cls['parameters'] = {}
        for k, param in parameters.items():
            parameter = {
                "name": param.name,
                "kind": param.kind.name,
            }

            if k in type_hints:
                input_type = annotation_to_input_type(type_hints[k])
                if input_type is not None:
                    parameter['type'] = input_type
            if param.default is not inspect.Parameter.empty and param.default is not Node._blank:
                parameter['default'] = as_jsonable(encoder, param.default)

            json_node_cls['parameters'][k] = parameter

    return json_node_cls

def node_to_json(encoder: JSONEncoder, node: Node):
    """Parses a node into a JSON object that can be sent to the client.
    
    Parameters
    ----------
    node : Node
        The node object to parse.
    """
    json_node = {}

    json_node['id'] = id(node)
    json_node['class'] = id(node.__class__)
    json_node['inputs'] = dict(node.inputs)
    json_node['logs'] = node.logs
    json_node['outdated'] = node._outdated
    json_node['errored'] = node._errored

    # Go over the inputs and find out which of them contain nodes
    # We need to mark them so that the GUI knows it. Then, we replace
    # the nodes by their ID.
    json_node['inputs_mode'] = {}
    for k, v in json_node['inputs'].items():
        if k  == node._args_inputs_key and len(v) > 0 and isinstance(v[0], Node):
            # This is the *args input, and it contains nodes
            json_node['inputs_mode'][k] = "NODE"
            json_node['inputs'][k] = [id(node) for node in v]
        elif k == node._kwargs_inputs_key and len(v) > 0 and isinstance(list(v.values())[0], Node):
            # This is the **kwargs input, and it contains nodes
            json_node['inputs_mode'][k] = "NODE"
            json_node['inputs'][k] = {k: id(node) for k, node in v.items()}
        elif isinstance(v, Node):
            # This is a simple input, and it contains a node
            json_node['inputs_mode'][k] = "NODE"
            json_node['inputs'][k] = id(v)
        else:
            json_node['inputs'][k] = as_jsonable(encoder, v)
    
    output = node._output

    if output is not Node._blank:
        json_node['output_class'] = output.__class__.__name__

        json_node['output'] = as_jsonable(encoder, output)
    
        if isinstance(output, sisl.viz.figure.PlotlyFigure):
            json_node['output_repr'] = {
                'type': 'plotlyfigure',
                'data': as_jsonable(encoder, output.figure),
            }
        else:
            try:
                html = output._repr_html_()
                json_node['output_repr'] = {
                    'type': 'html',
                    'data': html,
                }
            except:
                json_node['output_repr'] = {
                    'type': 'text',
                    'data': repr(output),
                }
        
    return json_node

class CustomJSONEncoder(JSONEncoder):
    """Custom JSON encoder that can handle more types than the default one.
    
    Specifically, it can handle: node objects, session objects, node classes
    and plotly figures.
    """

    def default(self, obj):

        if isinstance(obj, Node):
            return node_to_json(self, obj)
        elif isinstance(obj, Figure):
            return obj.to_plotly_json()
        elif hasattr(obj, "to_json"):
            return obj.to_json()
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.generic):
            return obj.item()
        elif isinstance(obj, pathlib.Path):
            return str(obj)
        elif isinstance(obj, type) and issubclass(obj, Node):
            return node_class_to_json(self, obj)
        elif isinstance(obj, type):
            return str(obj)
        
        try:
            return super().default(obj)
        except Exception as e:
            return str(obj)
        
class CustomJsonModule:
    """Class that mimics the simplejson module, but with a custom JSON encoder
    and ignoring NaN values by default (i.e. converting them to null)."""

    def __init__(self, encoder_cls=CustomJSONEncoder):
        self.encoder_cls = encoder_cls

    def dump(self, *args, **kwargs):
        if 'cls' not in kwargs:
            kwargs['cls'] = self.encoder_cls
        if 'ignore_nan' not in kwargs:
            kwargs['ignore_nan'] = True

        return simplejson.dump(*args, **kwargs)

    def dumps(self, *args, **kwargs):
        if 'cls' not in kwargs:
            kwargs['cls'] = self.encoder_cls
        if 'ignore_nan' not in kwargs:
            kwargs['ignore_nan'] = True

        return simplejson.dumps(*args, **kwargs)
    
    def loads(self, *args, **kwargs):
        return simplejson.loads(*args, **kwargs)
    
    def load(self, *args, **kwargs):
        return simplejson.load(*args, **kwargs)
        
    def __getattr__(self, key):
        return getattr(simplejson, key)