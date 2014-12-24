# import
#additional_import_paths = ["C:\\serv\\xampp\\compass_import"]
additional_import_paths = ["./compass_import"]

# parts dir
sass_dir = "./scss"
#images_dir = "images"

#generate dir
css_dir = "../css"
#generated_images_dir = "../img"
#http_generated_images_path = "../img"

# options
relative_assets = true
line_comments = false
cache = false
#output_style = :expanded
#output_style = :compressed

# Make a copy of sprites with a name that has no uniqueness of the hash.
on_sprite_saved do |filename|
  if File.exists?(filename)
    FileUtils.cp filename, filename.gsub(%r{-s[a-z0-9]{10}\.png$}, '.png')
    # Note: Compass outputs both with and without random hash images.
    # To not keep the one with hash, add: (Thanks to RaphaelDDL for this)
    FileUtils.rm_rf(filename)
  end
end

# Replace in stylesheets generated references to sprites
# by their counterparts without the hash uniqueness.
on_stylesheet_saved do |filename|
  if File.exists?(filename)
    css = File.read filename
    File.open(filename, 'w+') do |f|
      f << css.gsub(%r{-s[a-z0-9]{10}\.png}, '.png')
    end
  end
end