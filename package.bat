@echo off

rmdir /S /Q .\dist\Firefox
.\lib\7za.exe a -tzip .\dist\Firefox\FakespotReviewChecker.zip @package-firefox.txt
