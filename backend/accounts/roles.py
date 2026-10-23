"""Practice staff roles, implemented as Django/Wagtail groups (see ADR 0001)."""

PRAXISLEITUNG = "Praxisleitung"
EMPFANG = "Empfang"

COMMON_PERMISSIONS = [
    ("wagtailadmin", "access_admin"),
    ("patients", "view_patient"),
    ("patients", "add_patient"),
    ("patients", "change_patient"),
    ("patients", "approve_patient"),
    ("appointments", "view_appointment"),
    ("appointments", "add_appointment"),
    ("appointments", "change_appointment"),
]

PRACTICE_SETTINGS_PERMISSIONS = [
    (app, f"{action}_{model}")
    for app, model in [
        ("practice", "service"),
        ("practice", "weeklywindow"),
        ("practice", "closure"),
        ("practice", "specialhours"),
    ]
    for action in ("view", "add", "change", "delete")
] + [("practice", "change_schedulesettings")]

ROLE_PERMISSIONS = {
    EMPFANG: COMMON_PERMISSIONS,
    PRAXISLEITUNG: COMMON_PERMISSIONS
    + [
        ("patients", "block_patient"),
        ("accounts", "view_user"),
        ("accounts", "add_user"),
        ("accounts", "change_user"),
    ]
    + PRACTICE_SETTINGS_PERMISSIONS,
}
