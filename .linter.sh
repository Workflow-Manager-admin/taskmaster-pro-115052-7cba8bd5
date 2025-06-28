#!/bin/bash
cd /home/kavia/workspace/code-generation/taskmaster-pro-115052-7cba8bd5/react_task_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

