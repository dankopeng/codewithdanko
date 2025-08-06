/**
 * CodeWithDanko Backend API - Cloudflare Workers
 * 
 * A modern, production-ready API backend template
 */

interface ApiResponse {
	success: boolean;
	data?: any;
	error?: string;
	message?: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		// CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		// Handle CORS preflight
		if (method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// API Routes
		if (path.startsWith('/api/')) {
			try {
				let response: ApiResponse;

				switch (path) {
					case '/api/health':
						response = {
							success: true,
							data: {
								status: 'healthy',
								timestamp: new Date().toISOString(),
								environment: 'development',
								worker: 'codewithdanko-api',
								version: '1.0.0',
								tech_stack: ['Cloudflare Workers', 'TypeScript', 'D1', 'R2']
							},
							message: 'CodeWithDanko API is running successfully'
						};
						break;

					case '/api/posts':
						if (method === 'GET') {
							response = {
								success: true,
								data: [
									{
										id: '1',
										title: '探索雲原生技術：從概念到實踐',
										slug: 'cloud-native-exploration',
										excerpt: '雲原生技術正在改變我們構建和部署應用程序的方式...',
										date: '2025-07-15',
										category: '技術'
									},
									{
										id: '2', 
										title: '50歲創業：我的第一年經驗分享',
										slug: 'entrepreneurship-at-50',
										excerpt: '一年前，我在50歲時決定離開舒適區，開始一人創業之旅...',
										date: '2025-07-10',
										category: '創業'
									}
								],
								message: 'Posts retrieved successfully'
							};
						} else {
							response = {
								success: false,
								error: 'Method not allowed'
							};
						}
						break;

					default:
						response = {
							success: false,
							error: 'API endpoint not found'
						};
				}

				return new Response(JSON.stringify(response), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					},
					status: response.success ? 200 : 404
				});

			} catch (error) {
				const errorResponse: ApiResponse = {
					success: false,
					error: 'Internal server error',
					message: error instanceof Error ? error.message : 'Unknown error'
				};

				return new Response(JSON.stringify(errorResponse), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					},
					status: 500
				});
			}
		}

		// Default response for non-API routes
		const welcomeResponse: ApiResponse = {
			success: true,
			data: {
				name: 'CodeWithDanko Backend API',
				version: '1.0.0',
				description: 'Modern fullstack template backend API built with Cloudflare Workers',
				tech_stack: ['Cloudflare Workers', 'TypeScript', 'D1', 'R2'],
				features: ['Edge Computing', 'Auto Scaling', 'Global CDN', 'Zero Cold Starts'],
				endpoints: [
					'/api/health - Health check and system info',
					'/api/posts - Sample blog posts endpoint'
				],
				documentation: 'https://docs.codewithdanko.com'
			},
			message: 'Welcome to CodeWithDanko - Modern Fullstack Template API'
		};

		return new Response(JSON.stringify(welcomeResponse), {
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders
			}
		});
	},
} satisfies ExportedHandler<Env>;
