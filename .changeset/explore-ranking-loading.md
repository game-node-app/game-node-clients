---
"web": patch
"mobile": patch
---

Speed up the Explore ranking: load 96 games per page and prefetch the next page one-and-a-half viewports early. Also stop chaining an extra page after a filter change by reserving cover space before images load and mounting the sentinel only after the grid is laid out.
