from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


class SectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(label="Überschrift")
    paragraphs = blocks.ListBlock(blocks.TextBlock(label="Absatz"), label="Absätze")

    class Meta:
        icon = "doc-full"
        label = "Abschnitt"


class ValueBlock(blocks.StructBlock):
    icon = blocks.CharBlock(label="Icon (Material Icons)", required=False)
    title = blocks.CharBlock(label="Titel")
    text = blocks.TextBlock(label="Text")

    class Meta:
        icon = "pick"
        label = "Wert"


class GalleryImageBlock(blocks.StructBlock):
    image = ImageChooserBlock(label="Bild")
    caption = blocks.CharBlock(label="Bildunterschrift", required=False)

    class Meta:
        icon = "image"
        label = "Bild"


class LegalSectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(label="Überschrift")
    text = blocks.TextBlock(label="Text")

    class Meta:
        icon = "doc-full"
        label = "Abschnitt"
