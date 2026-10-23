from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet, SnippetViewSetGroup

from .models import FaqItem, LegalPage


class FaqViewSet(SnippetViewSet):
    model = FaqItem
    icon = "help"
    menu_label = "FAQ"
    list_display = ["question", "sort_order"]


class LegalPageViewSet(SnippetViewSet):
    model = LegalPage
    icon = "doc-full"
    menu_label = "Rechtliche Seiten"
    list_display = ["__str__", "title"]


class WebsiteGroup(SnippetViewSetGroup):
    menu_label = "Website"
    menu_icon = "globe"
    menu_order = 130
    items = (FaqViewSet, LegalPageViewSet)


register_snippet(WebsiteGroup)
