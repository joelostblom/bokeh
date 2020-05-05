import {CategoricalScale} from "../scales/categorical_scale"
import {ContinuousScale} from "../scales/continuous_scale"
import {LogScale} from "../scales/log_scale"
import {Scale} from "../scales/scale"
import {Range} from "../ranges/range"
import {Range1d} from "../ranges/range1d"
import {DataRange1d} from "../ranges/data_range1d"
import {FactorRange} from "../ranges/factor_range"

import {BBox, CoordinateTransform} from "core/util/bbox"

export type Ranges = {[key: string]: Range}
export type Scales = {[key: string]: Scale}

export class CartesianFrame {

  protected _bbox: BBox = new BBox()
  get bbox(): BBox {
    return this._bbox
  }

  get xview(): CoordinateTransform {
    return this.bbox.xview
  }

  get yview(): CoordinateTransform {
    return this.bbox.yview
  }

  constructor(private readonly in_x_scale: Scale,
              private readonly in_y_scale: Scale,
              readonly x_range: Range,
              readonly y_range: Range,
              private readonly extra_x_ranges: Ranges = {},
              private readonly extra_y_ranges: Ranges = {}) {
    this._configure_scales()
  }

  protected _x_target: Range1d
  protected _y_target: Range1d

  protected _x_ranges: Ranges
  protected _y_ranges: Ranges

  protected _xscales: Scales
  protected _yscales: Scales

  protected _get_ranges(range: Range, extra_ranges: Ranges): Ranges {
    return {...extra_ranges, default: range}
  }

  /*protected*/ _get_scales(scale: Scale, ranges: Ranges, frame_range: Range): Scales {
    const scales: Scales = {}

    for (const name in ranges) {
      const range = ranges[name]

      if (range instanceof DataRange1d || range instanceof Range1d) {
        if (!(scale instanceof ContinuousScale))
          throw new Error(`Range ${range.type} is incompatible is Scale ${scale.type}`)
      }

      if (range instanceof FactorRange) {
        if (!(scale instanceof CategoricalScale))
          throw new Error(`Range ${range.type} is incompatible is Scale ${scale.type}`)
      }

      if (scale instanceof LogScale && range instanceof DataRange1d)
        range.scale_hint = "log"

      const s = scale.clone()
      s.setv({source_range: range, target_range: frame_range})
      scales[name] = s
    }

    return scales
  }

  protected _configure_frame_ranges(): void {
    // data to/from screen space transform (left-bottom <-> left-top origin)
    const {bbox} = this
    this._x_target = new Range1d({start: bbox.left, end: bbox.right})
    this._y_target = new Range1d({start: bbox.bottom, end: bbox.top})
  }

  protected _configure_scales(): void {
    this._configure_frame_ranges()

    this._x_ranges = this._get_ranges(this.x_range, this.extra_x_ranges)
    this._y_ranges = this._get_ranges(this.y_range, this.extra_y_ranges)

    this._xscales = this._get_scales(this.in_x_scale, this._x_ranges, this._x_target)
    this._yscales = this._get_scales(this.in_y_scale, this._y_ranges, this._y_target)
  }

  protected _update_scales(): void {
    this._configure_frame_ranges()

    for (const name in this._xscales) {
      const scale = this._xscales[name]
      scale.target_range = this._x_target
    }

    for (const name in this._yscales) {
      const scale = this._yscales[name]
      scale.target_range = this._y_target
    }
  }

  recompute(bbox: BBox): void {
    this._bbox = bbox
    this._update_scales()
  }

  get x_ranges(): Ranges {
    return this._x_ranges
  }

  get y_ranges(): Ranges {
    return this._y_ranges
  }

  get xscales(): Scales {
    return this._xscales
  }

  get yscales(): Scales {
    return this._yscales
  }

  get x_scale(): Scale {
    return this._xscales.default
  }

  get y_scale(): Scale {
    return this._yscales.default
  }
}
