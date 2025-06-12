const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore lint errors during Netlify build
  },
  output: 'export', // ✅ Required for `next export`
}

export default nextConfig
