export interface FileSelectorModel {
	loadFile: (fileContents: ArrayBuffer) => void
}

export function FileSelector(model: FileSelectorModel) {
	return <div>
		<input type="file" name="file" onChange={event => {
			if (event.target === null) return console.error(`File input event.target is null.`)
			if (!('files' in event.target)) return console.error(`File input event.target doesn't have any files.`)
			if (!(event.target.files instanceof FileList)) return console.error(`File input event.target.files is not a FileList.`)

			const fileReader = new FileReader()
			fileReader.addEventListener('loadend', event => {
				if (event.target === null) return console.error(`File reader event.target is null.`)
				if (!(event.target.result instanceof ArrayBuffer)) return console.error(`Read file is not an array buffer.`)
				model.loadFile(event.target.result)
			})
			fileReader.readAsArrayBuffer(event.target.files[0])
		}} />
	</div>
}
