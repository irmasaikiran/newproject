let encodedData;

function encode() {
    const imgFile = document.getElementById('encodeImage').files[0];
    const text = document.getElementById('watermark').value;

    if (!imgFile || !text) {
        alert("Select image and enter watermark");
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => hide(img, text);
        img.src = e.target.result;
    };
    reader.readAsDataURL(imgFile);
}

function hide(img, text) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let binary = '';
    for (let i = 0; i < text.length; i++) {
        binary += text.charCodeAt(i).toString(2).padStart(8, '0');
    }
    binary += '00000000';

    for (let i = 0; i < binary.length; i++) {
        data[i * 4] = (data[i * 4] & 254) | parseInt(binary[i]);
    }

    ctx.putImageData(imgData, 0, 0);
    encodedData = canvas.toDataURL();
}

function download() {
    const a = document.createElement('a');
    a.href = encodedData;
    a.download = 'watermarked.png';
    a.click();
}

function decode() {
    const imgFile = document.getElementById('decodeImage').files[0];
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => extract(img);
        img.src = e.target.result;
    };
    reader.readAsDataURL(imgFile);
}

function extract(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let binary = '';

    for (let i = 0; i < data.length; i += 4) {
        binary += (data[i] & 1);
    }

    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.substr(i, 8);
        const char = String.fromCharCode(parseInt(byte, 2));
        if (char === '\0') break;
        text += char;
    }

    document.getElementById('result').innerText = "Extracted Watermark: " + text;
}
