import pathlib

from plotly.graph_objects import Figure
import numpy as np
import simplejson
from simplejson.encoder import JSONEncoder
from functools import partial

from flask import Flask
from flask_socketio import SocketIO

from sisl.viz.plotutils import load
from sisl.viz import Session

from .emiters import emit_plot, emit_session, emit_error, emit
from .user_management import with_user_management, if_user_can, listen_to_users


__all__ = ["APP", "SESSION", "SOCKETIO", "set_session", "create_app"]


__DEBUG = False


class CustomJSONEncoder(JSONEncoder):

    def default(self, obj):

        if isinstance(obj, Figure):
            return obj.to_plotly_json()
        elif hasattr(obj, "to_json"):
            return obj.to_json()
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.generic):
            return obj.item()
        elif isinstance(obj, pathlib.Path):
            return str(obj)

        return super().default(obj)

# We need to use simplejson because built-in json happily parses nan to NaN
# and then javascript does not understand it
simplejson.dumps = partial(simplejson.dumps, ignore_nan=True, cls=CustomJSONEncoder)

def create_app(get_session, set_session, async_mode="threading"):

    from sisl.viz import BlankSession, Plot

    app = Flask("SISL GUI API")

    # No user management yet
    if False:
        with_user_management(app)

    socketio = SocketIO(app, cors_allowed_origins="*",
                        json=simplejson, manage_session=True, async_mode=async_mode, max_http_buffer_size=1e20)
                        # We set max_http_buffer_size to 1e20 to in practice don't impose any limit on the size
                        # This is because big files might be transferred.
                        # async_mode="threading" this option can not use websockets, therefore there is less communication performance
                        # however, it's the only way we can emit socket events from outside of the thread that is running the api
                        # Maybe instead of threading we can use socketio.start_background_task (see https://github.com/miguelgrinberg/Flask-SocketIO/issues/876)
                        # You can set this to any other async_mode if you don't plan to interact from python (i.e. only through the GUI)
    on = socketio.on

    if False:
        listen_to_users(on, emit_session)

    # Create a new session
    new_session = BlankSession(socketio=socketio)
    set_session(new_session)
    new_session.socketio = socketio

    @socketio.on_error()
    def send_error(err):
        emit_error(err)
        raise err

    @on("request_session")
    @if_user_can("see")
    def send_session(path = None):

        session = get_session()

        if path is not None:
            session = load(path)
            set_session(session)

        emit_session(session, broadcast = False)

    @on("apply_method_on_session")
    @if_user_can("edit")
    def apply_method(method_name, kwargs={}, *args):

        if __DEBUG:
            print(f"Applying {method_name}. Args: {args}. Kwargs: {kwargs}")

        # If the user wants to save the session, we need to first remove
        # the socketio object, which is not serializable (also, we don't want to save it)
        if method_name == "save":
            session = get_session()
            session.socketio = None
            session.save(*args, **kwargs)
            session.socketio = socketio
            return

        if kwargs is None:
            # This is because the GUI might send None
            kwargs = {}

        # Remember that if the method is not found an error will be raised
        # but it will be handled socketio.on_error (used above)
        method = getattr(get_session().autosync, method_name)

        # Since the session is bound to the app, this will automatically emit the
        # session
        returns = method(*args, **kwargs)

        if kwargs.get("get_returns", None):
            # Let's send the returned values if the user asked for it
            event_name = kwargs.get("returns_as", "call_returns")
            emit(event_name, returns, {"method_name": method_name}, broadcast=False)

    @on("get_plot")
    @if_user_can("see")
    def retrieve_plot(plotID):
        if __DEBUG:
            print(f"Asking for plot: {plotID}")

        emit_plot(plotID, get_session(), broadcast=False)

    # Functions to receive uploaded files:
    def _write_file(session, file_bytes, name):
        dirname = session.get_setting("file_storage_dir")
        if not dirname.exists():
            dirname.mkdir()

        file_name = dirname / name
        with open(file_name, "wb") as fh:
            fh.write(file_bytes)

        keep = session.get_setting("keep_uploaded")

        return file_name, dirname, keep

    def _remove_temp_file(file_name, dirname):
        # Remove the file
        file_name.unlink()
        # If the directory is empty, remove it as well
        try:
            dirname.rmdir()
        except:
            pass

    @on("plot_file")
    @if_user_can("edit")
    def plot_uploaded_file(file_bytes, name):
        session = get_session()

        file_name, dirname, keep = _write_file(session, file_bytes, name)

        plot = Plot(file_name)
        session.autosync.add_plot(plot, session.tabs[0]["id"])

        if not keep:
            _remove_temp_file(file_name, dirname)

    @on("load_session_from_file")
    @if_user_can("edit")
    def load_session_from_file(file_bytes, name):
        session = get_session()

        file_name, dirname, keep = _write_file(session, file_bytes, name)

        session = load(file_name)
        if isinstance(session, Session):
            set_session(session)
            emit_session(session, broadcast=True)

        _remove_temp_file(file_name, dirname)

        if not isinstance(session, Session):
            raise ValueError("A session could not be loaded from the file provided.")
    
    @on("get_session_file")
    @if_user_can("see")
    def send_session_file():
        session = get_session()

        dirname = session.get_setting("file_storage_dir")
        if not dirname.exists():
            dirname.mkdir()

        file_name = dirname / "__temp_session"
        apply_method("save", {"path": file_name})

        with open(file_name, "rb") as fh:
            session_bytes = fh.read()
        
        emit("session_file", session_bytes, broadcast=False)

    return app, socketio
