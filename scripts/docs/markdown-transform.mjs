const rules = [

    // Headings
    [/#{6}\s?([^\n]+)/g, '<h6>$1</h6>'],
    [/#{5}\s?([^\n]+)/g, '<h5>$1</h5>'],
    [/#{4}\s?([^\n]+)/g, '<h4>$1</h4>'],
    [/#{3}\s?([^\n]+)/g, '<h3>$1</h3>'],
    [/#{2}\s?([^\n]+)/g, '<h2>$1</h2>'],
    [/#{1}\s?([^\n]+)/g, '<h1>$1</h1>'],

    // Bold, italic or paragraphs
    [/\*\*\s?([^\n]+)\*\*/g, '<strong>$1</strong>'],
    [/\*\s?([^\n]+)\*/g, '<em>$1</em>'],
    [/__([^_]+)__/g, '<b>$1</b>'],
    [/_([^_`]+)_/g, '<i>$1</i>'],
    [/\n/g, '<br />'],

    // Links
    [/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>'],

    // Lists
    [/([^\n]+)(\+)([^\n]+)/g, '<ul><li>$3</li></ul>'],
    [/([^\n]+)(\*)([^\n]+)/g, '<ul><li>$3</li></ul>'],

    // Images
    [/!\[([^\]]+)\]\(([^)]+)\s"([^")]+)"\)/g, '<img src="$2" alt="$1" title="$3" />'],

];

export function markdownToHTML(value) {
    if (!value) {
        return '';
    }

    let result = String(value)
        .replace(/<(.|\n)*?>/gm, '')
        .replace(/<(.|\n)*?/gm, '');

    for (const [rule, template] of rules) {
        result = result.replace(rule, template);
    }

    return result;
}
