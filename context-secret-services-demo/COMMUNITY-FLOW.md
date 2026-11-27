# Community reports — first implementation

Players solve the case, choose Share my investigation, preview and copy their
spoiler-wrapped caption, then paste and submit it themselves in Reddit comments.
There is no automatic comment submission or app-account proxy posting.
The app does not need user-action posting approval for this workflow.

## Moderation

The in-game gallery reads the latest 100 top-level comments on the current post
and shows up to 30 approved reports with the exact `CSS CASE 001 — Investigation`
heading. It uses Reddit's author attribution, not a player-supplied username.

For a new report, inspect its caption in Reddit's moderator interface and select
Approve if appropriate. Reject harassment, hate, threats, private information,
spam, or other rule-breaking content using Reddit's Remove/Spam actions.
Only approve after reading the whole report. Ordinary comments remain ordinary
discussion and never enter the gallery.

Reports are rendered as plain text. Removed, spam, deleted-author, malformed and
edited comments are excluded. Edited reports need to be submitted as a new comment
for review; this prevents edits from retaining an earlier approval in the gallery.
Players can open each comment to report it, delete their own, or access moderator
actions. The game refreshes from Reddit on each gallery opening or Refresh click.
There is no caption database or persistent gallery cache.

Manual approval protects the in-game gallery, not the underlying public comments.
Reddit's own moderation/spam/rate-limit controls apply there; this change does not
configure AutoModerator or promise that abusive comments cannot be posted.
Spoiler gating is a convenience on this browser session, not an access-control claim.

## Testing and rollout

Unit tests cover approvals, removal, edits, deleted authors, wrong posts, malformed
reports, spoiler escaping, length bounds and safe comment links. No comments are
posted as part of automated tests. A live player submission and moderator approval
still need to be tested manually before declaring the complete flow verified.

## Fallback

The installed version before this change is v0.0.8. Its source, assets and built
bundles are saved in the sibling `fallback-v0.0.8-before-sharing` folder, without
credentials or node_modules. To restore, copy that snapshot into a separate work
folder, install its locked dependencies with npm ci, build and upload/install it
as a new Devvit version. Keep the sharing working copy intact for investigation.
