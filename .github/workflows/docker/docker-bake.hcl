group "default" {
	targets = ["amd64", "arm64"]
}

target "amd64" {
	dockerfile = ".github/workflows/docker/Dockerfile.amd64"
	platforms = ["linux/amd64"]
	tags = ["misskey:amd64"]
}

target "arm64" {
	dockerfile = ".github/workflows/docker/Dockerfile.arm64"
	platforms = ["linux/arm64"]
	tags = ["misskey:arm64"]
}
