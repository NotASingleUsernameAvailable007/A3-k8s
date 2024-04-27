# Base image
FROM node:16-alpine

# Labels are for image metadata
LABEL maintainer="Maddy"

# Expose port 80 for the application
EXPOSE 80

# Set the working directory for any subsequent ADD, COPY, CMD, ENTRYPOINT, or RUN instructions
WORKDIR /opt/app

# Environment variables can be set
#ENV NODE_ENV=production

# Security good practice: avoid running as root
# ARG USER=appUser
# ARG UID=1002

# Add a new user for our application, without password
# RUN adduser --disabled-password --gecos "" --uid $UID $USER

# Copy package.json and package-lock.json for npm install
# This ensures that npm install is only re-run when these files change
COPY package.json package-lock.json ./

# Install dependencies - this can be done as root since it doesn't involve code execution
RUN npm install

# Copy the rest of your application's code
COPY . .

# Change ownership of the application files to our user
# RUN chown -R $USER .

# Switch to non-root user
# USER $USER

# Your application's default command, change as necessary
CMD ["node", "app.js"]
