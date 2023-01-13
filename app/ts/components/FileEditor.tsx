export interface FileEditorModel {
	name: ArrayBuffer,
	contents: ArrayBuffer,
	onChange: (newContent: ArrayBuffer) => void,
}

export function FileEditor(model: FileEditorModel) {
	const decoder = new TextDecoder()
	const name = decoder.decode(model.name).slice(0, -1)
	const contents = decoder.decode(model.contents).slice(0, -1)
	const onChange = (event: { target: EventTarget | null }) => {
		if (event.target === null) return console.error(`FileEditor onChange event.target === null`)
		if (!('value' in event.target)) return console.error(`FileEditor onChange event.target does not contain 'value' property`)
		if (typeof event.target.value !== 'string') return console.error(`FileEditor onChange event.target.value is not a string`)
		model.onChange(new TextEncoder().encode(event.target.value + '\0').buffer)
	}
	return <>
		<label for={name}>{name}</label>
		<br/>
		<textarea id={name} value={contents} onChange={onChange} spellcheck={false} style={{width: '100%', height: '500px' }}/>
	</>
}