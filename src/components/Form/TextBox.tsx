import { InputLabel } from '@mui/material';
import React, { useState } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TextBoxProps {
    value: string,
    setValue: any,
    label: string,
    height?: string
}
const modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }],
        [{ size: [] }],
        ['bold', 'italic', ,{ 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
    ],
    clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
    }
}

const formats = [
    'header', 'size',
    'bold', 'italic', 'background',
    'list', 'bullet', 
]


function TextBox({ value, setValue, label, height='150px' }: TextBoxProps) {

    return (
        <div style = {{marginBottom:'100px', height:height}}>
            <p style={{
                marginBottom: '-4px',
                marginLeft: '15px',
                color: '#645d5d',
                fontSize: 'smaller'
            }}>{label}</p>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
                style = {{height:'100%'}}

            />

        </div>
    )
}

export default TextBox


