import * as preactHooks from "preact/hooks";
import { FileEditor } from "./FileEditor.js";
import { FileSelector } from "./FileSelector.js";

export interface AppModel {
}

export function App(_model: AppModel) {
	const [files, setFiles] = preactHooks.useState<{ [path: string]: { name: ArrayBuffer, contents: ArrayBuffer } }>({})

	function parseFile(fileBuffer: ArrayBuffer) {
		const decoder = new TextDecoder('utf-8')
		const fileView = new DataView(fileBuffer)
		const headerValue = fileView.getUint32(0, true)
		if (headerValue !== 0x1e) throw new Error(`Not a ME2 Coalesced.ini file`)
		let offset = 4

		const foundFiles: typeof files = {}
		while (offset < fileView.byteLength) {
			const pathLength = fileView.getUint32(offset, true)
			offset += 4
			console.log(`File Path Length: ${pathLength}`)
			if (pathLength > 1000) throw new Error(`Unexpectedly long file path: ${pathLength}`)
		
			const fauxFilePath = fileBuffer.slice(offset, offset + pathLength)
			const decodedPath = decoder.decode(fauxFilePath)
			offset += pathLength
			console.log(`File Path: ${decodedPath}`)
			if (!decodedPath.startsWith('..\\BIOGame')) throw new Error(`Unexpected file path: ${fauxFilePath}`)
		
			const fauxFileLength = fileView.getUint32(offset, true)
			offset += 4
			console.log(`Faux File Length: ${fauxFileLength}`)
		
			const fauxFileString = fileBuffer.slice(offset, offset + fauxFileLength)
			offset += fauxFileLength
			// console.log(`Faux File:\n${fauxFileString}`)

			foundFiles[decodedPath] = { name: fauxFilePath, contents: fauxFileString }
		}

		setFiles(foundFiles)
	}

	function writeFile() {
		const length = 4 + Object.values(files).reduce((sum, { name, contents }) => sum + 4 + name.byteLength + 4 + contents.byteLength, 0)
		const buffer = new ArrayBuffer(length)
		const view = new DataView(buffer)
		const uint8Array = new Uint8Array(buffer)

		let offset = 0
		view.setUint32(0, 0x1e, true)
		offset += 4

		for (const {name, contents} of Object.values(files)) {
			// write length of the path
			view.setUint32(offset, name.byteLength, true)
			offset += 4
			// write path
			uint8Array.set(new Uint8Array(name), offset)
			offset += name.byteLength
			// write length of contents
			view.setUint32(offset, contents.byteLength, true)
			offset += 4
			// write contents
			uint8Array.set(new Uint8Array(contents), offset)
			offset += contents.byteLength
		}

		const blob = new Blob([buffer], { type: 'application/octet-stream' })
		const url = window.URL.createObjectURL(blob)
		const invisibleDownloadUrl = document.createElement('a');
		invisibleDownloadUrl.style.setProperty('display', 'none');
		document.body.appendChild(invisibleDownloadUrl);
		invisibleDownloadUrl.href = url;
		invisibleDownloadUrl.download = 'Coalesced.ini';
		invisibleDownloadUrl.click();
		window.URL.revokeObjectURL(url);
		invisibleDownloadUrl.remove();
	}

	return <div>
		<FileSelector loadFile={parseFile}/>
		<button onClick={writeFile}>Save Changes</button>
		{
			Object.entries(files).map(([decodedName, { name, contents }]) => <div style={{ paddingTop: '10px', paddingLeft: '50px', paddingRight: '50px' }}>
				<FileEditor name={name} contents={contents} onChange={newContent => { files[decodedName] = { name, contents: newContent }; setFiles(files)}} />
			</div>)
		}
	</div>
}
