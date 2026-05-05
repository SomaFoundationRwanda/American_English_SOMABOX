import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { pdfToPng } from 'pdf-to-png-converter';
import sharp from 'sharp';
import { config } from '../config/index.js';

/**
 * Automatically generates a thumbnail for a given file.
 * Supports: .mp4, .mov, .avi (Videos), .pdf (Documents), .jpg, .png (Images)
 * @param {string} filePath - Physical path to the source file
 * @returns {Promise<string|null>} - Relative URL of the generated thumbnail
 */
export async function generateThumbnail(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found for thumbnail generation: ${filePath}`);
            return null;
        }

        const ext = path.extname(filePath).toLowerCase();
        const filename = path.basename(filePath, ext);
        const thumbName = `thumb-${Date.now()}-${filename}.jpg`;
        const thumbDir = path.join(config.paths.content, config.defaults.customContentRoot, 'assets', 'thumbnails');
        
        if (!fs.existsSync(thumbDir)) {
            fs.mkdirSync(thumbDir, { recursive: true });
        }

        const thumbPath = path.join(thumbDir, thumbName);
        const relativeThumbPath = `/${config.defaults.customContentRoot}/assets/thumbnails/${thumbName}`;

        if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
            return new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .screenshots({
                        timestamps: ['10%'], // Take screenshot at 10% of the video
                        filename: thumbName,
                        folder: thumbDir,
                        size: '480x?'
                    })
                    .on('end', () => resolve(relativeThumbPath))
                    .on('error', (err) => {
                        console.error('Video thumbnail error:', err);
                        resolve(null);
                    });
            });
        } 
        
        if (ext === '.pdf') {
            try {
                const pngPages = await pdfToPng(filePath, {
                    viewportScale: 2.0,
                    pagesToConvertAsImage: [1] // Only first page
                });
                
                if (pngPages.length > 0) {
                    await sharp(pngPages[0].content)
                        .resize(480)
                        .toFile(thumbPath);
                    return relativeThumbPath;
                }
            } catch (err) {
                console.error('PDF thumbnail error:', err);
            }
        }

        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            try {
                await sharp(filePath)
                    .resize(480)
                    .toFile(thumbPath);
                return relativeThumbPath;
            } catch (err) {
                console.error('Image thumbnail error:', err);
            }
        }

        return null;
    } catch (error) {
        console.error('Global thumbnail generation error:', error);
        return null;
    }
}
