@echo off
cd .\FakespotReviewChecker

rmdir /S /Q ..\Firefox
..\7za.exe a -tzip ..\Firefox\FakespotReviewChecker.zip ^
	..\..\LICENSE.md^
	..\..\README.md^
	background.js^
	icon.svg^
	manifest.json
