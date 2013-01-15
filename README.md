node-http-proxy
===============

This is a stack allowing managing a node http proxy including live logs,
statistics, on live configuration.

It's composed of 3 seperated services.

Logging service
---------------
This service receive logs from the proxy and save it in a mongo database.

Supervision service
-------------------
This service allow proxy configuration management, statistics analysis, ...

Proxy service
-------------
This is the proxy server.
