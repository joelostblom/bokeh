import {View} from "core/view"
import * as visuals from "core/visuals"
import {RenderLevel} from "core/enums"
import {Box, Arrayable} from "core/types"
import * as p from "core/properties"
import {Model} from "../../model"
import {BBox} from "core/util/bbox"
import {Scale} from "../scales/scale"
import {Range} from "../ranges/range"
//import {build_view} from "core/build_views"

import type {Plot, PlotView} from "../plots/plot"
import type {CanvasView, CanvasLayer} from "../canvas/canvas"
import {Scope, CoordinateSystem} from "../canvas/scope"

export abstract class RendererView extends View {
  model: Renderer
  visuals: Renderer.Visuals

  parent: PlotView

  private _scope: CoordinateSystem

  initialize(): void {
    super.initialize()
    this.visuals = new visuals.Visuals(this.model)
    this._has_finished = true // XXX: should be in render() but subclasses don't respect super()

    const {x_range_name, y_range_name} = this.model as any
    const {frame} = this.plot_view
    this._scope = {
      get x_range(): Range { return frame.x_ranges[x_range_name] },
      get y_range(): Range { return frame.y_ranges[y_range_name] },
      get x_scale(): Scale { return frame.xscales[x_range_name] },
      get y_scale(): Scale { return frame.yscales[y_range_name] },
      get ranges(): [Range, Range] { return [this.x_range, this.y_range] },
      get scales(): [Scale, Scale] { return [this.x_scale, this.y_scale] },
      map_to_screen(xs: Arrayable<number>, ys: Arrayable<number>): [Arrayable<number>, Arrayable<number>] {
        const sxs = this.x_scale.v_compute(xs)
        const sys = this.y_scale.v_compute(ys)
        return [sxs, sys]
      },
      map_from_screen(sxs: Arrayable<number>, sys: Arrayable<number>): [Arrayable<number>, Arrayable<number>] {
        const xs = this.x_scale.v_invert(sxs)
        const ys = this.y_scale.v_invert(sys)
        return [xs, ys]
      },
    }
  }

  get canvas_view(): CanvasView {
    return this.parent.canvas_view
  }

  get plot_view(): PlotView {
    return this.parent
  }

  get plot_model(): Plot {
    return this.parent.model
  }

  get layer(): CanvasLayer {
    const {overlays, primary} = this.canvas_view
    return this.model.level == "overlay" ? overlays : primary
  }

  get scope(): CoordinateSystem {
    return this._scope
  }

  request_render(): void {
    this.plot_view.request_render()
  }

  notify_finished(): void {
    this.plot_view.notify_finished()
  }

  interactive_bbox?(sx: number, sy: number): BBox

  interactive_hit?(sx: number, sy: number): boolean

  get has_webgl(): boolean {
    return false
  }

  dirty: boolean = true

  abstract render(): void

  paint(): void {
    this.render()
  }

  get needs_clip(): boolean {
    switch (this.model.level) {
      case "image":
      case "underlay":
      case "glyph":
        return true
      default:
        return false
    }
  }

  get clip_box(): Box | null {
    return this.needs_clip ? this.plot_view.frame.bbox.box : null
  }
}

export namespace Renderer {
  export type Attrs = p.AttrsOf<Props>

  export type Props = Model.Props & {
    scope: p.Property<Scope | null>
    level: p.Property<RenderLevel>
    visible: p.Property<boolean>
  }

  export type Visuals = visuals.Visuals
}

export interface Renderer extends Renderer.Attrs {}

export abstract class Renderer extends Model {
  properties: Renderer.Props
  __view_type__: RendererView

  constructor(attrs?: Partial<Renderer.Attrs>) {
    super(attrs)
  }

  static init_Renderer(): void {
    this.define<Renderer.Props>({
      scope:   [ p.Instance,    null ],
      level:   [ p.RenderLevel       ],
      visible: [ p.Boolean,     true ],
    })
  }
}
