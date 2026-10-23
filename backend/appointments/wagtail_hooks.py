from wagtail import hooks

ACTIONS = {
    "request": "Termin angefragt",
    "cancel": "Termin abgesagt",
    "confirm": "Termin bestätigt",
    "decline": "Termin abgelehnt",
    "no_show": "Nicht erschienen",
    "book": "Termin durch die Praxis eingetragen",
    "block": "Zeit blockiert",
    "reschedule": "Termin verschoben",
}


@hooks.register("register_log_actions")
def register_appointment_log_actions(actions):
    for key, label in ACTIONS.items():
        actions.register_action(f"appointments.{key}", label, label)
