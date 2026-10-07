<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Planning print CSS must neutralize all screen-only ancestor spacing and minimum heights, and remove inter-page flex gaps; otherwise physical sheets gain blank pages.
- Keep authenticated browser print regressions in tests/printing_test.py; verify actual PDF page counts using the user's session without modifying planning data.
