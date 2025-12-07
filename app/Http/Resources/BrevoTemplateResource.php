<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BrevoTemplateResource extends JsonResource
{
    /**
     * Indicates if the resource's collection keys should not be wrapped.
     */
    public static $wrap = false;

    public function toArray($request)
    {
        return [
            'id' => $this['id'] ?? null,
            'name' => $this['name'] ?? null,
            'subject' => $this['subject'] ?? null,
            'is_active' => $this['isActive'] ?? false,
            'test_sent' => $this['testSent'] ?? false,
            'sender' => $this['sender'] ?? null,
            'reply_to' => $this['replyTo'] ?? null,
            'to_field' => $this['toField'] ?? null,
            'tag' => $this['tag'] ?? null,
            'html_content' => $this['htmlContent'] ?? null,
            'created_at' => $this['createdAt'],
            'modified_at' => $this['modifiedAt'],
            'doi_template' => $this['doiTemplate'] ?? null,
            'params' => $this->extractTemplateParams($this),
            'preview_url' => $this['previewUrl'] ?? null,
        ];
    }

    /**
     * Extract template parameters from the HTML content.
     *
     * @param array $template
     * @return array
     */
    protected function extractTemplateParams($template)
    {
        if (!isset($template['htmlContent'])) {
            return [];
        }

        preg_match_all('/\{\{\s*(.*?)\s*\}\}/', $template['htmlContent'], $matches);
        return array_unique($matches[1]);
    }
}
