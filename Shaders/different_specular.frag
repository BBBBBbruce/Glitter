// for different people's methods
#define PI 3.14159265

// Normal Distribution Function

float D_Blinn(float NdotH,float alpha_sq)
{
	return 1./(PI*alpha_sq)*pow(NdotH,2./alpha_sq-2.);
}

float D_Beckmann(float NdotH,float alpha_sq)
{
	return 1.0 / (PI*alpha_sq*pow(NdotH,4.0))*exp((NdotH * NdotH - 1.0) / (alpha_sq * NdotH * NdotH));
}

float D_GGX(float NdotH,float alpha_sq)
{
	return alpha_sq/(PI*pow(NdotH*NdotH*(alpha_sq-1.)+1.,2.0));
}

// Geometric Shadowing

float G_Implicit(float NdotL, float NdotV)
{
	return NdotL*NdotV;
}

float G_Neumann(float NdotL, float NdotV)
{
	return NdotL*NdotV/max(NdotL,NdotV);
}


float G_CookTorrence(float NdotL, float NdotV, float VdotH, float NdotH){
	return min(1.,min(2.*NdotH*NdotV/VdotH,2.*NdotH*NdotL/VdotH));
}

float G_Kelemen(float NdotL, float NdotV, float VdotH)
{
	return NdotL*NdotV/VdotH/VdotH;
}

// Smith method: 

float G_b (float vec, float a)
{
	float c = vec/(a*sqrt(1.-vec*vec));
	if (c<1.6)
		return (3.535*c + 2.181*c*c)/(1.+2.276*c+2.577*c*c);
	else
		return 1.;
} 

float G_Beckmann(float NdotV, float alpha, float NdotL)
{	
	return G_b(NdotV,alpha)*G_b(NdotL,alpha);
}

float G_GGX(float NdotV, float alpha_sq, float NdotL)
{
	float gv = 2.*NdotV/(NdotV+sqrt(alpha_sq+(1.-alpha_sq)*NdotV*NdotV));
	float gl = 2.*NdotL/(NdotL+sqrt(alpha_sq+(1.-alpha_sq)*NdotL*NdotL));
	return gl*gv;
}

float G_Schlick(float NdotV, float alpha, float NdotL)
{
	float k = alpha*sqrt(2./PI);
	float gv = NdotV/(NdotV*(1.-k)+k);
	float gl = NdotL/(NdotL*(1.-k)+k);
	return gl*gv;
}

float G_Schlick_UE4(float NdotV, float alpha, float NdotL)
{
	float k = alpha/2.;
	float gv = NdotV/(NdotV*(1.-k)+k);
	float gl = NdotL/(NdotL*(1.-k)+k);
	return gl*gv;
}

//Fresnel

float F_Schlick(float f0, float VdotH)
{
	return f0+(1.-f0)*pow(1.-VdotH,5.0);
}


float F_CookTorrence(float f0, float VdotH)
{
	float neta = (1.+sqrt(f0))/(1.-sqrt(f0));
	float g = sqrt(neta*neta+VdotH*VdotH-1.);
	return 0.5*pow((g-VdotH)/(g+VdotH),2.)*(1+pow(((g-VdotH)*VdotH-1)/((g+VdotH)*VdotH+1),2.));
}

