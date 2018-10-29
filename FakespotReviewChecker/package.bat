@echo off
cd .\FakespotReviewChecker

rmdir /S /Q ..\Firefox
..\7za.exe a -tzip ..\Firefox\FakespotReviewChecker.zip ^
	..\..\LICENSE.md^
	..\..\README.md^
	..\..\PRIVACY^
	background.js^
	icon.svg^
	manifest.json^
	opt-in.html^
	opt-in.js^
	options.html^
	options.js
