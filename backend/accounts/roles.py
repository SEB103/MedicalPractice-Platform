"""Practice staff roles, implemented as Django/Wagtail groups (see ADR 0001)."""

PRAXISLEITUNG = "Praxisleitung"
EMPFANG = "Empfang"

COMMON_PERMISSIONS = [
    ("wagtailadmin", "access_admin"),
    ("patients", "view_patient"),
    ("patients", "add_patient"),
    ("patients", "change_patient"),
    ("patients", "approve_patient"),
]

ROLE_PERMISSIONS = {
    EMPFANG: COMMON_PERMISSIONS,
    PRAXISLEITUNG: COMMON_PERMISSIONS
    + [
        ("patients", "block_patient"),
        ("accounts", "view_user"),
        ("accounts", "add_user"),
        ("accounts", "change_user"),
    ],
}
