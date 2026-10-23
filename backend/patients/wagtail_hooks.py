from wagtail import hooks


@hooks.register("register_log_actions")
def register_patient_log_actions(actions):
    actions.register_action("patients.create", "Patient angelegt", "Patient angelegt")
    actions.register_action("patients.approve", "Patient freigegeben", "Patient freigegeben")
    actions.register_action("patients.reject", "Patient abgelehnt", "Patient abgelehnt")
    actions.register_action("patients.block", "Patient gesperrt", "Patient gesperrt")
    actions.register_action(
        "patients.link", "Konto mit Patient verbunden", "Konto mit Patient verbunden"
    )
