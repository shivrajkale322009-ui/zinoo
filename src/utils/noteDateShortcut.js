// Handle input events so the shortcut works with mobile keyboards too.
export function updateNoteWithDate(event, setValue, today = new Date()) {
  const input = event.currentTarget;
  const cursor = input.selectionStart;
  const native = event.nativeEvent;
  if (!native.isComposing && native.inputType === 'insertText' && ['/', '.', '@'].includes(native.data) && input.value[cursor - 1] === native.data) {
    const date = `${today.getDate()}-${today.getMonth() + 1}`;
    const value = input.value.slice(0, cursor - 1) + date + input.value.slice(cursor);
    setValue(value);
    requestAnimationFrame(() => {
      if (input.isConnected && document.activeElement === input) input.setSelectionRange(cursor - 1 + date.length, cursor - 1 + date.length);
    });
  } else setValue(input.value);
}
