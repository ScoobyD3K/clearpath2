import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save, User as UserIcon, Upload, X, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      setFullName(userData.full_name || "");
      setMonthlyIncome(userData.monthly_income || "");
      setProfilePicture(userData.profile_picture || null);
    };
    fetchUser();
  }, []);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.auth.updateMe({
        profile_picture: file_url,
      });

      setProfilePicture(file_url);
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload profile picture");
    }
    setIsUploading(false);
  };

  const handleRemoveProfilePicture = async () => {
    setIsUploading(true);
    try {
      await base44.auth.updateMe({
        profile_picture: null,
      });

      setProfilePicture(null);
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
      toast.success("Profile picture removed");
    } catch (error) {
      toast.error("Failed to remove profile picture");
    }
    setIsUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await base44.auth.updateMe({
        full_name: fullName,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
      });
      
      toast.success("Profile updated successfully!");
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      toast.error("Failed to update profile");
    }

    setIsSaving(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" title="Back to Dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Your Profile</h1>
            <p className="text-slate-600 mt-2">Update your personal and financial information</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Profile Picture Section */}
              <div>
                <Label className="text-slate-700 mb-3 block">Profile Picture</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white text-3xl font-bold">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    {profilePicture && (
                      <button
                        onClick={handleRemoveProfilePicture}
                        disabled={isUploading}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Label
                      htmlFor="profile-picture-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-sm font-medium text-slate-700"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Picture
                        </>
                      )}
                    </Label>
                    <p className="text-xs text-slate-500 mt-2">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label className="text-slate-700">Email</Label>
                  <Input 
                    value={user.email} 
                    disabled 
                    className="mt-1 bg-slate-50"
                  />
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                </div>
                <Button
                  type="button"
                  onClick={async () => {
                    setIsSaving(true);
                    await base44.auth.updateMe({ full_name: fullName });
                    const updatedUser = await base44.auth.me();
                    setUser(updatedUser);
                    setIsSaving(false);
                    toast.success("Name updated!");
                  }}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Name
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <Label htmlFor="monthlyIncome" className="text-slate-700 font-medium">
                    Savings
                  </Label>
                  <p className="text-sm text-slate-500 mb-2">
                    Your total savings or available funds
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">$</span>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      min="0"
                      step="0.01"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="e.g., 5000"
                      className="pl-8 text-lg"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}