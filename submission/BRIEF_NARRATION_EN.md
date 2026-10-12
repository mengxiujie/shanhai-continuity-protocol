# Client brief · English narration for operational film

Status: **recording script, not final audio or film**. About 210 spoken words; measure actual delivery before assigning a duration. Read naturally, with the outcome words left on screen long enough to verify. On-screen evidence labels in `BRIEF_VIDEO_CAPTURE.md` are mandatory even if the spoken narration is shortened.

## Full read

An event organizer approved a brief for Friday at seven. The announcement was ready. Then the event moved to Saturday at three.

Here is the question: when the next AI agent asks for context, should it receive the old brief, the corrected brief, or the organizer's entire planning conversation?

Shanhai makes the handoff explicit. The organizer selects one approved item. Private notes and an unapproved suggestion stay outside the grant. The content remains encrypted off-chain; Monad records the recipient, scope, version and authorization.

In this recorded testnet run, the sender checks Monad before releasing the envelope. A separate recipient process checks again before it decrypts.

Version one is authorized. Agent B receives Friday at seven. The announcement you see is a fixed template filled from the decrypted fields—not AI-generated copy.

Now the organizer corrects the date. The old request is rejected as **VERSION STALE**. No new envelope, decryption or context is produced. Publishing the correction did not approve it automatically.

Only after a separate version-two grant does Agent B receive Saturday at three and update the announcement.

Then the organizer revokes that grant. The next request is **REVOKED**, with zero new downstream work. Revocation cannot recall plaintext already delivered while permission was valid.

Five successful Monad transactions, four recorded gate outcomes, and two unchanged browser exports let you inspect the run. The page was reloaded between exports; we show that boundary rather than hiding it.

This is a fixed fictional brief and a deterministic template. No live model or production service is claimed. The contribution is narrower—and testable: **the next handoff follows the owner's current approval.**

## Editorial pronunciation and cuts

- Say “version stale” as two plain words; let the screen show the exact code `VERSION_STALE`. Likewise speak “revoked,” with `REVOKED` on screen.
- “Agent B” is a separate local recipient process; do not imply a different company or a second user wallet.
- If over 140 seconds, cut the two explanatory sentences about the full conversation and template, not the independent V2 grant, revocation limit, browser-export boundary or “no live model” disclosure.
- The final speaker may be synthetic; label narration separately from product/model execution. Do not reuse the prior preference-case English audio under these new visuals.
