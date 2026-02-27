'use client'
import React, { useState } from 'react';
import TreeNavigation from './TreeNavigation';
import SectionEditor from './SectionEditor';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;



const FileManager = () => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[#00274c]/5 border border-slate-100 min-h-[calc(100vh-140px)]">
            {/* Full Width Section Editor */}
            <SectionEditor />
        </div>
    );
};

export default FileManager;