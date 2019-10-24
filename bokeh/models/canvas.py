#-----------------------------------------------------------------------------
# Copyright (c) 2012 - 2020, Anaconda, Inc., and Bokeh Contributors.
# All rights reserved.
#
# The full license is in the file LICENSE.txt, distributed with this software.
#-----------------------------------------------------------------------------
''' Models for representing coordinate systems.

'''

#-----------------------------------------------------------------------------
# Boilerplate
#-----------------------------------------------------------------------------

import logging # isort:skip
log = logging.getLogger(__name__)

#-----------------------------------------------------------------------------
# Imports
#-----------------------------------------------------------------------------

# Bokeh imports
from ..core.enums import OutputBackend
from ..core.properties import Bool, Enum, Instance, List
from ..model import Model
from .layouts import LayoutDOM
from .ranges import DataRange1d, Range, Range1d
from .renderers import Renderer
from .scales import LinearScale, Scale

#-----------------------------------------------------------------------------
# Globals and constants
#-----------------------------------------------------------------------------

__all__ = (
    "Canvas",
    "Scope",
)

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------

class Canvas(LayoutDOM):

    renderers = List(Instance(Renderer), help="""
    """)

    hidpi = Bool(default=True, help="""
    Whether to use HiDPI mode when available.
    """)

    output_backend = Enum(OutputBackend, default="canvas", help="""
    Specify the output backend for the plot area. Default is HTML5 Canvas.

    .. note::
        When set to ``webgl``, glyphs without a WebGL rendering implementation
        will fall back to rendering onto 2D canvas.
    """)

class Scope(Model):

    x_range = Instance(Range, default=lambda: DataRange1d(), help="""
    The source range of the x-dimension of the plot.
    """)

    y_range = Instance(Range, default=lambda: DataRange1d(), help="""
    The source range of the y-dimension of the plot.
    """)

    x_scale = Instance(Scale, default=lambda: LinearScale(), help="""
    Defines how to map x-coordinates from data to screen space.
    """)

    y_scale = Instance(Scale, default=lambda: LinearScale(), help="""
    Defines how to map y-coordinates from data to screen space.
    """)

    x_target = Instance(Range1d, default=None, help="""
    The target range in the x-dimension onto which the sources range will be mapped.
    """)

    y_target = Instance(Range1d, default=None, help="""
    The target range in the y-dimension onto which the sources range will be mapped.
    """)

    outer = Instance("bokeh.models.canvas.Scope", default=None, help="""
    The outer (or parent) scope into this scope maps. If unset, the frame of a plot is used.
    """)

    def scope(self, **kwargs):
        return Scope(outer=self, **kwargs)

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------
