/**
 * An MDX document that defines React components says so, once, above the prose.
 *
 * MDX is not compiled here, so the component source is neither run nor printed as
 * body copy. Saying nothing would leave a document that visibly does less than it
 * reads like it should.
 */
export function NotExecutedNotice() {
    return (
        <p className="border-mark bg-mark-soft/60 text-ink mt-6 border-l px-4 py-3 text-[0.8125rem] leading-relaxed">
            <span className="text-mark-read mr-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                Not executed
            </span>
            This document defines React components. They are not compiled or run — the reader shows its Markdown only,
            and the component source has been left out rather than printed as prose.
        </p>
    );
}
