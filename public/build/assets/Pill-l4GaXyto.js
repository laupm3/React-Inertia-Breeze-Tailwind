import{j as e}from"./app-fwyInB3c.js";const s={point:"bg-gray-500",bg:"bg-gray-500/30",text:"text-gray-500",border:"border-gray-500"},x={xs:{container:"text-xs px-2 py-1 gap-1.5",point:"w-1.5 h-1.5",text:"text-xs font-medium"},sm:{container:"text-sm px-3 py-1.5 gap-2",point:"w-2 h-2",text:"text-sm font-medium"},md:{container:"text-sm px-4 py-1.5 gap-2",point:"w-2.5 h-2.5",text:"text-sm font-bold"},lg:{container:"text-base px-4 py-2 gap-2.5",point:"w-3 h-3",text:"text-base font-bold"}};function u({identifier:n=null,mapColor:a={},children:o,className:i="",size:r="md",textClassName:p=null}){const l=n&&a[n]||s,{point:m,bg:d,text:c,border:g}=l,t=x[r]||x.md,f=p||t.text;return e.jsxs("div",{className:`
            flex flex-row items-center w-fit rounded-full
            ${t.container}
            ${d} ${c} 
            ${i}
        `,children:[e.jsx("div",{className:`${m} ${t.point} rounded-full flex-shrink-0`}),e.jsx("span",{className:f,children:o||"No definido"})]})}export{u as P};
