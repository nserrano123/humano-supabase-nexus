# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/aa03e31b-1db4-418c-8eb7-3b049bdd5941

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/aa03e31b-1db4-418c-8eb7-3b049bdd5941) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (PostgreSQL database and backend)

## Intelligent Agents

This project includes AI-powered agents in the `agents/` directory:

### ProspectMatcher Agent

An intelligent recruitment agent that performs semantic analysis to match job candidates with positions.

**Location**: `agents/prospect-matcher/`

**Features**:
- Semantic matching using GPT-4
- Automated prospect evaluation
- REST API for integration
- Match scoring (0-100 scale)
- Detailed insights with strengths and gaps

**Quick Start**:
```bash
cd agents/prospect-matcher
./setup.sh
npm run dev
```

See [agents/prospect-matcher/README.md](agents/prospect-matcher/README.md) for full documentation.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/aa03e31b-1db4-418c-8eb7-3b049bdd5941) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
