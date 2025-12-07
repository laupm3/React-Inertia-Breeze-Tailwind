<?php

/**
 * Get translations from a JSON file, if not found return the fallback language file
 *
 * @param string $json_path Path to the JSON file
 * @return array<string>
 */
function translations($json_path)
{
    if (!file_exists($json_path)) {
        return [];
    }

    return json_decode(file_get_contents($json_path), true);
}
