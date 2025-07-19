// Utility to trigger file input and handle upload
export function triggerFileInput(onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".md,.mdx,.txt";
    input.onchange = onUpload;
    input.click();
}
