import {isFunction} from "@bokehjs/core/util/types"
import {isEqual} from "@bokehjs/core/util/eq"
import {Class} from "@bokehjs/core/class"

type ToFn = {
  to: Throw
}

type ToVal<T> = {
  to: Be<T>
}

type Throw = {
  throw(): void
  not: NotThrow
}

type NotThrow = {
  throw(): void
}

type Be<T> = {
  be: Assertions<T>
  not: NotBe<T>
}

type NotBe<T> = {
  be: Assertions<T>
}

type Assertions<T> = {
  equal(expected: T): void
  //instanceof(): void
}

/*
type BoolAssertions = {
  true:
}
*/

class Asserts implements Assertions<unknown> {
  constructor(readonly value: unknown, readonly negated: boolean = false) {}

  equal(expected: unknown): void {
    if (!isEqual(this.value, expected) == this.negated) {
      const be = this.negated ? "not be" : "be"
      throw new ExpectationError(`expected ${this.value} to ${be} equal to ${expected}`)
    }
  }

  get undefined(): void {
    return this.equal(undefined)
  }
  get null(): void {
    return this.equal(null)
  }
  get false(): void {
    return this.equal(false)
  }
  get true(): void {
    return this.equal(true)
  }
  get NaN(): void {
    return this.equal(NaN)
  }

  equivalent(expected: unknown): void {
    if ((this.value !== expected) == this.negated) {
      const be = this.negated ? "not be" : "be"
      throw new ExpectationError(`expected ${this.value} to ${be} equivalent to ${expected}`)
    }
  }

  instanceof(expected: Class<unknown>): void {
    if (!(this.value instanceof expected) == this.negated) {
      const be = this.negated ? "not be" : "be"
      throw new ExpectationError(`expected ${this.value} to ${be} an instance of ${expected}`)
    }
  }

  //above
  //below
}

export class ExpectationError extends Error {
  constructor(message: string) {
    super(message)
  }
}

function Throws(fn: () => unknown) {
  return function(error_type?: Class<Error>, pattern?: RegExp) {
    try {
      fn()
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ExpectationError(`expected ${fn} to throw a proper exception, got ${error}`)
      }

      if (error_type != null && !(error instanceof error_type)) {
        throw new ExpectationError(`expected ${fn} to throw an exception of type ${error_type}, got ${error}`)
      }

      if (pattern != null && !error.message.match(pattern)) {
        throw new ExpectationError(`expected ${fn} to throw an exception matching ${pattern}, got ${error}`)
      }

      return
    }

    throw new ExpectationError(`expected ${fn} to throw an exception, but it did not`)
  }
}

function NotThrows(fn: () => unknown) {
  return function(error_type?: Class<Error>, pattern?: RegExp) {
    try {
      fn()
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ExpectationError(`expected ${fn} to not throw, got ${error}`)
      }

      if (error_type != null && error instanceof error_type) {
        throw new ExpectationError(`expected ${fn} to not throw an exception of type ${error_type}, got ${error}`)
      }

      if (pattern != null && error.message.match(pattern)) {
        throw new ExpectationError(`expected ${fn} to not throw an exception matching ${pattern}, got ${error}`)
      }
    }
  }
}

export function expect(fn: () => unknown): ToFn
export function expect<T>(val: T): ToVal<T>

export function expect<T>(fn_or_val: (() => unknown) | T): ToFn | ToVal<T> {
  if (isFunction(fn_or_val)) {
    const fn = fn_or_val
    return {
      to: {
        throw: Throws(fn),
        not: {throw: NotThrows(fn)},
      },
    }
  } else {
    const val = fn_or_val
    return {
      to: {
        be: new Asserts(val),
        not: {be: new Asserts(val, true)},
      },
    }
  }
}

/*
.to.throw
.to.not.throw

.to.be.equal
.to.be.deep.equal
.to.be.instanceof
.to.be.undefined
.to.be.null
.to.be.false
.to.be.true
.to.be.NaN
.to.be.above
.to.be.below

.to.not.be.*

.to.be.closeTo
.to.be.empty
.to.be.within          T=number

.to.equal
.to.eql
.to.be.eql
.to.be.instanceOf
.to.be.an.instanceof
.to.deep.equal
.to.be.of.length
.to.be.empty.and.an
.to.be.not.undefined
.to.have.property
.to.have.members
.to.contain
.to.include
.to.have.any.keys
.to.not.include
.to.be.not.null
.to.not.be.undefined
*/
