import { digixnew } from '../utils/digixnew.js';
import { downloadmediamessage } from 'baileys';
import fs from 'fs';
import path from 'path';
import stylizedchar from '../utils/fancy.js';

export async function viewonce(client, message) {
    const remotejid = message.key.remotejid;
    const quotedmessage = message.message?.extendedtextmessage?.contextinfo?.quotedmessage;

    if (!quotedmessage?.imagemessage?.viewonce && !quotedmessage?.videomessage?.viewonce && !quotedmessage?.audiomessage?.viewonce) {
        await client.sendmessage(remotejid, stylizedchar({ text: '_reply to a valid viewonce message._' }));
        return;
    }

    const content = digixnew(quotedmessage);

    function modifyviewonce(obj) {
        if (typeof obj !== 'object' || obj === null) return;
        for (const key in obj) {
            if (key === 'viewonce' && typeof obj[key] === 'boolean') {
                obj[key] = false;
            } else if (typeof obj[key] === 'object') {
                modifyviewonce(obj[key]);
            }
        }
    }

    modifyviewonce(content);

    try {
        if (content?.imagemessage) {
            const mediabuffer = await downloadmediamessage(
                { message: content },
                'buffer',
                {}
            );

            if (!mediabuffer) {
                console.error('failed to download media.');
                return await client.sendmessage(remotejid, {
                    text: stylizedchar('_failed to download the viewonce media. please try again._'),
                });
            }

            const tempfilepath = path.resolve('./temp_view_once_image.jpeg');
            fs.writefilesync(tempfilepath, mediabuffer);

            await client.sendmessage(remotejid, {
                image: { url: tempfilepath },
            });

            fs.unlinksync(tempfilepath);

        } else if (content?.videomessage) {
            const mediabuffer = await downloadmediamessage(
                { message: content },
                'buffer',
                {}
            );

            if (!mediabuffer) {
                console.error('failed to download media.');
                return await client.sendmessage(remotejid, {
                    text: stylizedchar('_failed to download the viewonce media. please try again._'),
                });
            }

            const tempfilepath = path.resolve('./temp_view_once_image.mp4');
            fs.writefilesync(tempfilepath, mediabuffer);

            await client.sendmessage(remotejid, {
                video: { url: tempfilepath },
            });

            fs.unlinksync(tempfilepath);

        } else if (content?.audiomessage) {
            const mediabuffer = await downloadmediamessage(
                { message: content },
                'buffer',
                {}
            );

            if (!mediabuffer) {
                console.error('failed to download media.');
                return await client.sendmessage(remotejid, {
                    text: stylizedchar('_failed to download the viewonce media. please try again._'),
                });
            }

            const tempfilepath = path.resolve('./temp_view_once_image.mp3');
            fs.writefilesync(tempfilepath, mediabuffer);

            await client.sendmessage(remotejid, {
                audio: { url: tempfilepath },
            });

            fs.unlinksync(tempfilepath);

        } else {
            console.error('no imagemessage found in the quoted message.');
            await client.sendmessage(remotejid, {
                text: stylizedchar('_no valid imagemessage to modify and send._')
            });
        }
    } catch (error) {
        console.error('error modifying and sending viewonce message:', error);
        await client.sendmessage(remotejid, {
            text: stylizedchar('_an error occurred while processing the viewonce message._'),
        });
    }
}

export default viewonce;