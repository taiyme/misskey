export const pushHash = (baseHash: string, additionalHash: string): string => {
	if (baseHash.startsWith("#")) return baseHash + "-" + additionalHash;

	return "#" + additionalHash;
};

export const popHash = (
	hashStr: string
): { popped: string; newHash: string } => {
	if (!new RegExp(/#(.*)$/).test(hashStr)) return { popped: "", newHash: "" };

	const hashArray = hashStr.split("-");
	const popped = hashArray.pop() || "";

	return {
		popped: popped,
		newHash: hashArray.join("-"),
	};
};
