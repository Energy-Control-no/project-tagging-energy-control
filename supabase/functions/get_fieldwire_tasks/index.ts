import { verifyUserAuth } from "../_shared/auth_utils.ts";
import { generateFieldwireToken } from "../_shared/fieldwire_api.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchFieldwireTasks(token: string, project_id: string) {
  const tasksUrl = `https://client-api.us.fieldwire.com/api/v3/projects/${project_id}/tasks`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "Fieldwire-Version": "2024-01-01",
      "Fieldwire-Per-Page": "1000",
      "Fieldwire-Filter": "active",
      authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(tasksUrl, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks for project ${project_id}`);
  }
  return await response.json();
}

async function fetchFieldwireTeamIds(token: string, project_id: string) {
  const tasksUrl = `https://client-api.us.fieldwire.com/api/v3/projects/${project_id}/teams`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "Fieldwire-Version": "2024-01-01",
      "Fieldwire-Per-Page": "1000",
      authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(tasksUrl, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch task teams for project ${project_id}`);
  }
  return await response.json();
}

async function fetchFieldwireStatuses(token: string, project_id: string) {
  const taskStatusesUrl = `https://client-api.us.fieldwire.com/api/v3/projects/${project_id}/statuses`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "Fieldwire-Version": "2024-01-01",
      "Fieldwire-Per-Page": "1000",
      "Fieldwire-Filter": "active",
      authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(taskStatusesUrl, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch task statuses for project ${project_id}`);
  }
  return await response.json();
}

async function getTaskDeviceLinkStatus(projectId: string) {
  try {
    let { data, error } = await supabase.from("devices").select("fw_id, created_at, fw_task_id, at_serialNumber, at_deviceName").eq("fw_id", projectId);

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error fetching device link status:", err);
    throw err;
  }
}

const enrichTaskInfo = async (tasks: any[], teams: any[], statuses: any[], project_id: string) => {
  const devicesLinked = await getTaskDeviceLinkStatus(project_id);
  console.log(devicesLinked);
  return tasks.map((task) => {
    const team = teams.find((team) => team.id === task.team_id);
    const status = statuses.find((status) => status.id === task.status_id);
    const deviceInfo = devicesLinked ? devicesLinked.find((device) => device.fw_task_id === task.id) : null;
    return {
      ...task,
      team_name: team ? team.name : null,
      team_handle: team ? team.handle : null,
      status_name: status ? status.name : null,
      deviceInfo: deviceInfo || null,
    };
  });
};

Deno.serve(async (req) => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // This allows all domains. For production, specify your domain instead.
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  try {
    if (req.method === "OPTIONS") {
      // Handle CORS preflight request
      return new Response(null, { status: 204, headers });
    }

    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers,
      });
    }

    const isAuthenticated = await verifyUserAuth(req);
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers,
      });
    }

    const url = new URL(req.url);
    const project_id = url.searchParams.get("project_id");
    console.log(`project_id: ${project_id}`);
    if (!project_id) {
      return new Response(JSON.stringify({ error: "Project ID is required" }), {
        status: 400,
        headers,
      });
    }
    const token = await generateFieldwireToken();
    console.log(`token: ${token}`);
    const tasks = await fetchFieldwireTasks(token, project_id);
    console.log("tasks:", tasks);
    const teams = await fetchFieldwireTeamIds(token, project_id);
    console.log("teams:", teams);
    const statuses = await fetchFieldwireStatuses(token, project_id);
    console.log("teams:", teams);
    const enrichedTasks = await enrichTaskInfo(tasks, teams, statuses, project_id);
    console.log("enrichedTasks:", enrichedTasks);
    return new Response(JSON.stringify({ tasks: enrichedTasks }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
});
