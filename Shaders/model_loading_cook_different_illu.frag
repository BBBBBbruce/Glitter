#version 330 core
out vec4 FragColor;
#define PI 3.14159265


uniform sampler2D texture_diffuse1;
uniform sampler2D texture_specular1;
uniform sampler2D texture_normal1;
uniform sampler2D texture_roughness1;


struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

in vec3 FragPos;  
in vec3 Normal;  
in vec2 TexCoords;

uniform float f0 = 0.8;//0.5-1.0
uniform float k = 0.2;
uniform float scene_size = 1;
uniform float light_specular_strength = 0.01;
uniform float light_diffuse_strength = 0.1;

uniform vec3 viewPos;





vec3 CookTorrance(vec3 materialDiffuseColor,vec3 materialSpecularColor,	vec3 normal, vec3 lightDir,	vec3 viewDir, Light light)
{
	float NdotL = max(0, dot(normal, lightDir));
	float distance    = length(light.position - FragPos);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance     = light.position * attenuation;     
	float Rs = 0.0;
	vec3 H = normalize(lightDir + viewDir);
	float NdotH = max(0, dot(normal, H));
	float NdotV = max(0, dot(normal, viewDir));
	float VdotH = max(0, dot(lightDir, H));
	float alpha_sq = texture(texture_roughness1, TexCoords).x * texture(texture_roughness1, TexCoords).x;

	// Fresnel reflectance
	//float F = pow(1.0 - VdotH, 5.0);
	float F = f0+(1.-f0)*pow(1.-VdotH,5.0);

	if (NdotL > 0) 
	{

		float D = alpha_sq/(PI*pow(NdotH*NdotH*(alpha_sq-1.)+1.,2.0));

		float gv = 2.*NdotV/(NdotV+sqrt(alpha_sq+(1.-alpha_sq)*NdotV*NdotV));
		float gl = 2.*NdotL/(NdotL+sqrt(alpha_sq+(1.-alpha_sq)*NdotL*NdotL));
		float G =  gl*gv;

		Rs = (F * D * G) / (PI * NdotL * NdotV);

		
		//return (kD * materialDiffuseColor / PI + Rs) * radiance * NdotL; 
	}

	float kS = F;
    float kD = 1. - kS;

	//return (kD * materialDiffuseColor / PI + Rs) * radiance * NdotL; 
	return materialDiffuseColor * light.diffuse * NdotL + light.specular * materialSpecularColor * NdotL * (k + Rs * (1.0 - k));
}


void main()
{	
	Light lights[8] = Light[8](
		Light(vec3(scene_size, scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(scene_size, -scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, -scene_size, scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(scene_size, scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(scene_size, -scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength)),

		Light(vec3(-scene_size, -scene_size, -scene_size), 
		vec3(0.2, 0.2, 0.2),
		vec3(light_diffuse_strength, light_diffuse_strength, light_diffuse_strength),
		vec3(light_specular_strength, light_specular_strength, light_specular_strength))
	);

	FragColor = vec4(0);

	Light light = 
		Light(vec3(10,10,10), 
		vec3(0.2, 0.2, 0.2),
		vec3(0.9,0.9,0.9),
		vec3(0.9,0.9,0.9));


	vec3 norm = normalize(Normal+texture(texture_normal1, TexCoords).x);
	vec3 lightDir = normalize(light.position - FragPos);
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 diffuse = texture(texture_diffuse1, TexCoords).xyz;
	vec3 specular = texture(texture_specular1, TexCoords).xyz;
	float roughness = texture(texture_roughness1, TexCoords).x;
	vec3 ct = CookTorrance(diffuse, specular,norm,lightDir,viewDir,light);
	FragColor = vec4(ct, 1.0);  


	// +++++++++++ set up the scene ++++++++
	
	for(int i =0;i<8;i++){
		light = lights[i];
		lightDir = normalize(light.position - FragPos);
		ct = CookTorrance(diffuse, specular,norm,lightDir,viewDir,light);
		FragColor += vec4(ct, 1.0);
	}

	// ++++++++++ end of scene setup ++++++++



} 