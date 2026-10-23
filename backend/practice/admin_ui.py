from wagtail.admin.ui.tables import Column


class StatusBadgeColumn(Column):
    """Listing column rendering ``status_tone`` of the row object as a coloured badge."""

    cell_template_name = "practice/admin/status_cell.html"
