
def _patch():
    from sisl.viz import Session, Plot

    from .server.sync import Connected

    # Patch the Session and Plot classes so that they work with the GUI
    # This is a bit ugly but it works for now
    def connect_class(cls):
        cls.socketio = Connected.socketio
        cls._socketio = None
        cls.autosync = Connected.autosync
        cls.emit = Connected.emit

    connect_class(Session)
    connect_class(Plot)

    # The Session class needs some extra patches to make sure the socket
    # connection is transmitted to plots
    def _transmit_socket_to_plot(session, plot, tabID=None):
        plot.socketio = session.socketio

    Session._on_plot_added = _transmit_socket_to_plot

    def _remove_socket_from_plot(session, plot):
        plot.socketio = None

    Session._on_plot_removed = _transmit_socket_to_plot

    def _transmit_socket_change(session):
        """ Transmit the socketio change to all the plots """
        for plot in session.plots.values():
            _transmit_socket_to_plot(session, plot)

    Session._on_socketio_change = _transmit_socket_change

    def _session_get_dict_for_GUI(self):
        """
        This method is thought mainly to prepare data to be sent through the API to the GUI.
        Data has to be sent as JSON, so this method can only return JSONifiable objects. (no numpy arrays, no NaN,...)
        """
        info_dict = {
            "id": self.id,
            "tabs": self.tabs,
            "settings": self.settings,
            "params": self.params,
            "paramGroups": self._param_groups,
            "updatesAvailable": self.updates_available(),
            "plotOptions": [
                {"value": subclass.__name__, "label": subclass.plot_name()}
                for subclass in self.get_plot_classes()
            ],
            "structures": self.get_structures(),
            "plotables": self.get_plotables()
        }

        return info_dict

    Session._get_dict_for_GUI = _session_get_dict_for_GUI

    # Apply also some patches to Plot
    def _plot_get_dict_for_GUI(self):
        """ This method is thought mainly to prepare data to be sent through the API to the GUI.
        Data has to be sent as JSON, so this method can only return JSONifiable objects. (no numpy arrays, no NaN,...)
        """
        from sisl.viz.input_fields import ProgramaticInput

        info_dict = {
            "id": self.id,
            "plotClass": self.__class__.__name__,
            "struct": getattr(self, "struct", None),
            "figure": getattr(self, "figure", None),
            "settings": {param.key: self.settings[param.key] for param in self.params if not isinstance(param, ProgramaticInput)},
            "params": self.params,
            "paramGroups": self.param_groups,
            "grid_dims": getattr(self, "grid_dims", None),
            "shortcuts": self.shortcuts_for_json
        }

        return info_dict

    Plot._get_dict_for_GUI = _plot_get_dict_for_GUI
