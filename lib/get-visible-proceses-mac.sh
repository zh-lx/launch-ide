#!/bin/bash

# Get all visible applications and their executable paths
get_visible_processes() {
    # 获取所有 visible 应用名
    local app_names=$(
        osascript <<EOF
tell application "System Events"
    set visibleApps to name of every application process whose visible is true
end tell
EOF
    )

    echo "$app_names" | tr ',' '\n' | while read app_name; do
        # 去除前后空格
        local app_trimmed=$(echo "$app_name" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

        # 获取进程路径（取首个匹配项）
        local pid=$(pgrep -ix "$app_trimmed" | head -n 1)

        if [[ -n "$pid" ]]; then
            local exe_path=$(ps -p "$pid" -o comm=)
            echo "$app_trimmed: $exe_path"
        else
            echo "$app_trimmed: PID not found"
        fi
    done
}

# Check if osascript exists
if command -v osascript >/dev/null 2>&1; then
    # Use get_visible_processes if osascript is available
    get_visible_processes
else
    # Fallback to ps command if osascript is not available
    ps ax -o comm= | sort | uniq | while read process; do
        if [[ -n "$process" ]]; then
            echo "$process"
        fi
    done
fi
