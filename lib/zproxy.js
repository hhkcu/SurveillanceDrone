const reqTypes = {
    text: "text",
    json: "json",
    buffer: "arrayBuffer"
}

export async function request(url, method, headers, body, type) {
    const result = await fetch("https://zv7i.dev/zproxy", {
        method: "post",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            "url": url,
            "reqheaders": headers,
            "reqbody": body,
            "reqtype": type,
            "reqmethod": method
        })
    });
    return (await result[reqTypes[type]]());
}