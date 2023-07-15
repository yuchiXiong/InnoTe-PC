const showTitle = (title: string) => {
  return title.endsWith('.md') ? title.slice(0, -3) : title;
}

export default showTitle;