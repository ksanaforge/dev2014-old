taskkill /im explorer.exe /f  
CD /d %userprofile%\AppData\Local
DEL IconCache.db /a
explorer.exe