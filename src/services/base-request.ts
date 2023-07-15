const baseRequest = <T>(url: string): Promise<T> => {
  return fetch(url).then((response) => response.json()).catch((error) => {
    console.error(error);
  });
}

export default baseRequest;
