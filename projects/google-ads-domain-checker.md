---
title: Google Ads Domain Checker
category: data
tech: TypeScript, Apify SDK, got-scraping, vitest
born: 2026
status: live
summary: Check a list of domains for live Google Ads and get one row per domain, on the Apify Store.
link: on the Apify Store | https://apify.com/saekoto/google-ads-domain-check
link: source on GitHub | https://github.com/sopika2/google-ads-domain-checker
---
Give it a list of domains and it returns one flat row per domain from Google's public Ads Transparency Center: whether the domain is advertising right now, the advertiser behind it, Google's ad-count range, when an ad was last shown, how long the longest ad has run, and the text, image and video mix.

Put it on a schedule and it also reports which ads appeared and which ended since the previous run, so you can watch a competitor's advertising change over time.

It works over plain HTTP with no browser and no login, which keeps it fast and cheap: three dollars per thousand domains and one dollar per thousand ad rows, with nothing charged for a domain that errored. TypeScript, Apify SDK, 107 tests, MIT licensed.
